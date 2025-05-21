const jwt = require("jsonwebtoken");
import { Role } from '../../serverless-backend/types';

export default function generateSWToken({ email, role }: { email: string; role: Role }) {
    const secretKey = process.env.JWT_SECRET;

    if (!secretKey) {
        throw new Error('SECRET_KEY environment variable is not defined');
    }
    return jwt.sign({ email, role }, secretKey, { expiresIn: '8h' });
}