import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication failed' });
    }

    try {
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decodedData?.id;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Authentication failed' });
    }
};

export default auth;
