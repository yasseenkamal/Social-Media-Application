

export const validation = (Schema, args) => {

    const validationResult = Schema.validate(args, { abortEarly: false })

    if (validationResult.error) {
        throw new Error(validationResult.error.toString())
    }


    return true

}
