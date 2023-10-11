export class ApiFeatures {
    constructor(mongooseQuery, queryData) {
        this.mongooseQuery = mongooseQuery;
        this.queryData = queryData;
    }

    inDate = async () => {
        if (this.queryData?.fromDay) {
             this.queryData.fromDay = new Date(new Date((this.queryData?.fromDay)).setHours(0,0,0,0,)).toISOString()
             this.queryData.toDay = new Date(new Date(new Date(this.queryData?.toDay||new Date())) .setHours(23,59,59,999)).toISOString()
            this.mongooseQuery.find(
                {
                    createdAt: {
                        $gte: this.queryData.fromDay,
                        $lte: this.queryData.toDay
                    }
                }
            )
        }
        return this
    }
    filter = () => {
        const excluded = ["sort", "page", "size", "fields", "searchKey", "fromDay","toDay"];
        let queryFields = {...this.queryData};
        excluded.forEach((ele) => {
            delete queryFields[ele];
        });
        queryFields = JSON.parse(
            JSON.stringify(queryFields).replace(
                /lte|lt|gte|gt/g,
                (match) => `$${match}`
            )
        );
        this.mongooseQuery.find(queryFields);
        return this;
    };
    search = () => {
        if (this.queryData?.searchKey)
            this.mongooseQuery.find({
                $or: [
                    {name: {$regex: this.queryData.searchKey}},
                    {description: {$regex: this.queryData.searchKey}},
                ],
            });
        return this;
    };
    sort = () => {
        if (this.queryData?.sort)
            this.mongooseQuery.sort(this.queryData.sort.replace(/,/g, " "));
        return this;
    };
    pagination = async () => {
        let {size, page} = this.queryData;
        if (page <= 0 || !page) page = 1;
        if (size <= 0 || !size) size = 5;
        const skip = size * (this.queryData.page - 1);
        const docsCount = await this.mongooseQuery.clone().count();
        this.mongooseQuery.skip(skip).limit(size);
        const totalPages = Math.ceil(docsCount / size) || 1;
        return {
            docsCount,
            totalPages: totalPages || 1,
            page: page || 1,
            size
        };
    };
}
