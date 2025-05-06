import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const { name, phone, comment, cart } = req.body;
    const MS_TOKEN = '534f3fef594f45bac9acd06ebaebf1940a1130c2';
    const ORG_ID = '95eacaf5-9b71-11ef-0a80-106000ae1558';

    if (!name || !phone || !cart || !Array.isArray(cart) || cart.length === 0) {
        return res.status(400).json({ error: 'Некорректные данные' });
    }

    // 1. Найти или создать контрагента
    let agentMeta = null;
    try {
        // Поиск по телефону
        const searchUrl = `https://api.moysklad.ru/api/remap/1.2/entity/counterparty?search=${encodeURIComponent(phone)}`;
        console.log('Поиск контрагента по телефону:', searchUrl);
        const searchRes = await fetch(searchUrl, {
            headers: {
                'Authorization': `Bearer ${MS_TOKEN}`,
                'Accept': 'application/json;charset=utf-8',
            },
        });
        const searchData = await searchRes.json();
        console.log('Результат поиска контрагента:', searchData);
        if (searchData.rows && searchData.rows.length > 0) {
            // Если контрагент найден, используем его meta
            agentMeta = searchData.rows[0].meta;
        } else {
            // Если не найден — создаём нового контрагента
            console.log('Контрагент не найден, создаём нового:', { name, phone });
            const createRes = await fetch('https://api.moysklad.ru/api/remap/1.2/entity/counterparty', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${MS_TOKEN}`,
                    'Accept': 'application/json;charset=utf-8',
                    'Content-Type': 'application/json',
                },
                // Используем имя и телефон из формы
                body: JSON.stringify({ name, phone }),
            });
            const createData = await createRes.json();
            console.log('Результат создания контрагента:', createData);
            if (createData.meta) {
                // Используем meta созданного контрагента
                agentMeta = createData.meta;
            } else {
                // Если создать не удалось, возвращаем ошибку
                console.error('Ошибка создания контрагента:', createData);
                return res.status(500).json({ error: 'Ошибка создания контрагента', details: createData });
            }
        }
    } catch (e) {
        console.error('Ошибка поиска/создания контрагента:', e);
        return res.status(500).json({ error: 'Ошибка поиска/создания контрагента', details: e.message });
    }

    // Если meta контрагента не получено, прекращаем выполнение
    if (!agentMeta) {
        return res.status(500).json({ error: 'Не удалось получить meta контрагента' });
    }

    // 2. Формируем заказ для МойСклад с использованием meta контрагента
    const order = {
        organization: {
            meta: {
                href: `https://api.moysklad.ru/api/remap/1.2/entity/organization/${ORG_ID}`,
                type: "organization",
                mediaType: "application/json"
            }
        },
        // Передаём meta контрагента
        agent: {
            meta: {
                ...agentMeta, // Копируем существующие поля из agentMeta
                type: "counterparty", // Добавляем тип для контрагента
                mediaType: "application/json"
            }
        },
        description: comment || '', // Добавляем пустую строку, если комментарий отсутствует
        positions: cart.map(item => ({
            quantity: item.qty,
            price: item.price * 100, // Цена в копейках
            assortment: {
                meta: {
                    href: `https://api.moysklad.ru/api/remap/1.2/entity/product/${item.id}`,
                    type: "product", // Добавляем тип для товара
                    mediaType: "application/json"
                }
            }
        }))
    };

    // 3. Отправляем заказ в МойСклад
    try {
        console.log('Отправляем заказ в МойСклад:', order);
        const msRes = await fetch('https://api.moysklad.ru/api/remap/1.2/entity/customerorder', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MS_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(order)
        });

        if (!msRes.ok) {
            const errText = await msRes.text();
            console.error('Ошибка МойСклад:', msRes.status, errText);
            // Пытаемся парсить JSON для более детальной ошибки
            let errDetails = {};
            try {
                errDetails = JSON.parse(errText);
            } catch (jsonError) {
                // Если не JSON, оставляем текст
                errDetails = { message: errText };
            }
            return res.status(500).json({ error: 'Ошибка МойСклад при создании заказа', details: errDetails });
        }

        // Если все успешно
        const orderData = await msRes.json();
        console.log('Заказ успешно создан:', orderData);
        return res.status(200).json({ success: true, order: orderData });

    } catch (e) {
        console.error('Ошибка отправки заказа в МойСклад:', e);
        return res.status(500).json({ error: 'Внутренняя ошибка при отправке заказа', details: e.message });
    }
}