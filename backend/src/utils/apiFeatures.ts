export class APIFeatures {
  query: any;
  queryString: any;

  constructor(query: any, queryString: any) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    const queryObj = { ...this.queryString };
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

    // Advanced filtering (gte, gt, lte, lt)
    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    const parsedQuery = JSON.parse(queryStr);

    // Apply filters
    this.query = this.query.find(parsedQuery);

    return this;
  }

  dateFilter() {
    const { startDate, endDate } = this.queryString;

    if (startDate || endDate) {
      const dateQuery: any = {};

      if (startDate) {
        dateQuery.$gte = new Date(startDate);
      }

      if (endDate) {
        dateQuery.$lte = new Date(endDate);
      }

      this.query = this.query.find({
        date: dateQuery,
      });
    }

    return this;
  }
  sort() {
    if (this.queryString.sort) {
      let sortBy = '';
      if (typeof this.queryString.sort === 'string') {
        sortBy = this.queryString.sort.split(",").join(" ");
      } else if (Array.isArray(this.queryString.sort)) {
        sortBy = this.queryString.sort.join(" ");
      }
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-date");
    }

    return this;
  }

  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 10;

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
