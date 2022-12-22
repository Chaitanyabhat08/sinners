class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }
    search() {
        const keyword = this.queryStr ? {
            name: {
                $regex: this.queryStr,
                $options: "i"
            }
        } : {};
        this.query = this.query.find({ ...keyword });
        return this;
    }
    filter() {
        const queryCopy = { ...this.queryStr };//Bcuz it won't change the original query string it just creates a copy of the querystring
        //Removing some fields from the querystring
        const removeFields = ['keyword', 'page', 'limit'];
        removeFields.forEach(key => {
            delete queryCopy[key];
        });
        //filter for price and rating fields
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, key => `$${key}`) // /\b()\b/g creates a reg exp $$ bcuz it creates $gte for mongo query
        this.query = this.query.find(JSON.parse(queryStr)); //becomes object
        return this;
    }
    pagination(resultPerPage) {
        const currentPage = (this.queryStr && Number(this.queryStr.page )) || 1;
        const skip = resultPerPage * (currentPage - 1);
        this.query = this.query.limit(resultPerPage).skip(skip);
        return this;
    }
};
module.exports = ApiFeatures;