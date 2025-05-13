import { useRouter } from "next/router";

const ProductPage = () => {
    const router = useRouter();
    const { id, sellerId } = router.query;
    
    return (
        <div>
        <h1>Product Page</h1>
        <p>This is the product page.</p>
        </div>
    );
}