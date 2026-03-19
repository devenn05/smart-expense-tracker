export class APIFeatures {
  query: any;
  queryString: any;

  constructor(query: any, queryString: any) {
    // mongoose query (e.g. Model.find())
    this.query = query;

    // req.query from URL
    this.queryString = queryString;
  }

  filter() {
    // clone query params so we don’t mutate original
    const queryObj = { ...this.queryString };

    // remove params that are not actual filters
    const excludedFields = [
      'page',
      'sort',
      'limit',
      'fields',
      'startDate',
      'endDate',
      'search'
    ];

    excludedFields.forEach((el) => delete queryObj[el]);

    // convert operators like gte, lte into MongoDB format ($gte, $lte)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    const parsedQuery = JSON.parse(queryStr);

    // apply filters to mongoose query
    // example: amount[gte]=100 → { amount: { $gte: 100 } }
    this.query = this.query.find(parsedQuery);

    return this;
  }

  dateFilter() {
    const { startDate, endDate } = this.queryString;

    // apply date range filter if provided
    if (startDate || endDate) {
      const dateQuery: any = {};

      if (startDate) {
        dateQuery.$gte = new Date(startDate);
      }

      if (endDate) {
        dateQuery.$lte = new Date(endDate);
      }

      // filter based on date field
      this.query = this.query.find({
        date: dateQuery,
      });
    }

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      let sortBy = '';

      // supports ?sort=amount,-date OR array format
      if (typeof this.queryString.sort === 'string') {
        sortBy = this.queryString.sort.split(",").join(" ");
      } else if (Array.isArray(this.queryString.sort)) {
        sortBy = this.queryString.sort.join(" ");
      }

      this.query = this.query.sort(sortBy);
    } else {
      // default sorting (latest first)
      this.query = this.query.sort("-date");
    }

    return this;
  }

  paginate() {
    // page & limit from query params
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 10;

    // calculate how many docs to skip
    const skip = (page - 1) * limit;

    // apply pagination to query
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}