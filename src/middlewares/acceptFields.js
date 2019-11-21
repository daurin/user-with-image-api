module.exports = (fields = []) => {
    return (req, res, next) => {
        let errors = [];
        let keys = Object.keys(req.body)
        for (const item of keys) {
            if (!fields.includes(item)) errors.push(item);
        }

        if (errors.length > 0) {
            res.status(400).json(res.status(400).json({
                errors: errors.map((key, i) => ({
                    field:key,
                    message: 'Invalid key'
                }))
            }))
        }
        else next();
    }
}