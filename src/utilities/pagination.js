

export const paginationFunction = ({ page = 1, size = 3 } = {}) => {

    if (page < 1) { page = 1 }
    if (size < 1) { size = 3 }

    const limit = size // number of data in one page
    const skip = (page - 1) * size  // skip ...

    return { limit, skip }


}