const BadRequestException = require('../exceptions/bad_request_exception');

const is_valid_date = (date) => {
    return new Date(date) != 'Invalid Date';
};

module.exports.validate_data_types = (what_to_validate, data_types) => {
    for (const field in data_types) {
        let validator;
        const data_type = data_types[field];
        switch (data_type) {
            case 'date':
                validator = (x) => {
                    return is_valid_date(x);
                };
                break;
            case 'array':
                validator = (x) => {
                    return Array.isArray(x);
                };
                break;
            default:
                validator = (x) => {
                    return typeof x === data_type;
                };
        }
        if (!validator(what_to_validate[field])) {
            throw new BadRequestException(`${field} must be provided as ${data_types[field]}`);
        }
    }
};
