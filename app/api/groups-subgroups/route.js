export async function GET() {
  // Пример тестовых данных
  const data = [
    {
      id: 1,
      name: "Группа 1",
      subgroups: [
        { id: 11, name: "Подгруппа 1-1" },
        { id: 12, name: "Подгруппа 1-2" }
      ]
    },
    {
      id: 2,
      name: "Группа 2",
      subgroups: [
        { id: 21, name: "Подгруппа 2-1" }
      ]
    }
  ];
  return Response.json(data);
}
