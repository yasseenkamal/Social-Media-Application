


export const asyncHandler = (yk) => {
    return (req, res, next) => {
        yk(req, res, next).catch(error => {
            error.cause = 500;
            return next(error, { cause: 500 })
        })
    }
}

export const globalErrorHaneling = (error, req, res, next) => {
    if (process.env.MOOD == 'DEV') {
        return res.status(error.cause || 400).json({ message: 'G error', error, msg: error.message, stack: error.stack })
    }
    return res.status(error.cause || 400).json({ message: 'G error', error, msg: error.message })



}