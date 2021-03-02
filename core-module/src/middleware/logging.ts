import morgan from 'morgan';

export default morgan('[:date]: :method :url :status - :response-time ms', {
    skip: function (req, res) { return req.method === 'OPTIONS' }
});