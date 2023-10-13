import { paginationFunction } from "./pagination.js"



export class ApiFeatures {

    constructor(mongooseQuery, queryData) {

        this.mongooseQuery = mongooseQuery  // by this we make key called mongooseQuery in this class and its value is mongooseQuery
        this.queryData = queryData          // by this we make key called queryData in this class and its value is queryData

    }

    // pagination method...
    pagination() {

        const { page, size } = this.queryData
        const { limit, skip } = paginationFunction({ page, size })

        this.mongooseQuery.limit(limit).skip(skip)
        return this

    }


    // sort method ...

    sortMethod() {

        const { sort} = this.queryData
        this.mongooseQuery.sort(sort?.replaceAll(',',' '))
        return this

    }

    // select method....

    selectMethod() {

        const { select} = this.queryData
        this.mongooseQuery.select(select?.replaceAll(',',' '))
        return this

    }

    // filter method...

    filterMethod() {

        const queryInstance = { ...this.queryData }
        const execuldKeyArr = ['page', 'size', 'sort', 'select', 'search']
        execuldKeyArr.forEach((key) => { delete queryInstance[key] })
    
        const queryString = JSON.stringify(queryInstance).replace(/gt|gte|lt|lte|eq|ne|in|nin|and|or|not|regex/g, (match) => `$${match}`)
        const queryJson = JSON.parse(queryString) 

        this.mongooseQuery.find(queryJson)
        return this

    }


}