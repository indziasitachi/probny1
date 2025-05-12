'use server';
export default function VapidKeyScript() {
    return (
        <script
            dangerouslySetInnerHTML={{
                __html: `window.NEXT_PUBLIC_VAPID_PUBLIC_KEY='${process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''}';`
            }}
        />
    );
} 