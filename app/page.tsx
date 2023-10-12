
import dynamic from "next/dynamic";
const ClientHashRouter = dynamic(() => import('@/components/common/client-hash-router'), {
    ssr: false,
});
export default function App() {
    return (
        <ClientHashRouter />
    )
}
