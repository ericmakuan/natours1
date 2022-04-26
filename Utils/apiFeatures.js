class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        const queryObj = { ...this.queryString };  //新的OBJ且不會影響到舊的
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);//去除上面所圈選的

        let queryStr = JSON.stringify(queryObj);// 將其變string 
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        //g表示可以重複多次   將特定字串加上$以使其應用在MONGOOSE裡
        
        this.query.find(JSON.parse(queryStr));

        return this; //才能使下一個filter運作
    }

    sort() {
        if(this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
          this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('_id');  //若沒有SORT 則預設按照id順序 時間有問題
        };
        return this; //才能使下一個filter運作
    }


    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');//將__V除外
        };
        return this; //才能使下一個filter運作
    }

    paginate() {
        const page = this.queryString.page * 1 || 1; //預設為1 第一頁
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;