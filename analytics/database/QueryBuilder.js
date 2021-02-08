class QueryBuilder {
    constructor(bucket) {
        this.query = `from(bucket: \"${bucket}\")`;
    }

    raw(query) {
        this.query += query;
        return this;
    }

    range(range) {
        this.query += ` |> range(start: -${range})`;
        return this;
    }

    filter(filter) {
        return new QueryFilter(filter, this);
    }

    aggregateWindow(every, fn, empty = false) {
        this.query += ` |> aggregateWindow(every: ${every}, fn: ${fn}, createEmpty: ${empty})`;
        return this;
    }

}

class QueryFilter {
    constructor(filter, builder) {
        this.query = filter ? ` |> filter(fn: (r) => ${filter})` : ' |> filter(fn: (r) =>';
        this.builder = builder;
    }
    field(field) {
        this.query += ` r._field == "${field}"`
        return this;
    }

    measurement(measurement) {
        this.query += ` r._measurement == "${measurement}"`
        return this;
    }
    value() {
        this.query += ` r._value`
        return this;
    }
    tag(name, value) {
        this.query += ` r.${name} == "${value}"`
        return this;
    }
    and() {
        this.query += ' and'
        return this;
    }
    equals(target) {
        if (typeof target === 'string') {
            this.query += ` == "${target}"`

        } else {
            this.query += ` == ${target}`
        }
        return this;
    }
    greater(target) {
        this.query += ` > ${target}`
        return this;
    }
    smaller(target) {
        this.query += ` < ${target}`
        return this;
    }
    greaterEquals(target) {
        this.query += ` >= ${target}`
        return this;
    }
    smallerEquals(target) {
        this.query += ` <= ${target}`
        return this;
    }
    finish() {
        return this.builder.raw(this.query + ')')
    }
}


module.exports = QueryBuilder;