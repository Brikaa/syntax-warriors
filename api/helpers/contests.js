const data_types_helper = require('../helpers/data_types');
const BadRequestException = require('../exceptions/bad_request_exception');

module.exports.validate_and_filter_contest_info = (contest_info) => {
    data_types_helper.validate_data_types(contest_info, {
        name: 'string',
        description: 'string',
        start_date: 'date',
        end_date: 'date',
        test_cases: 'array'
    });

    const { name, description, start_date, end_date, test_cases } = contest_info;

    if (name === '') {
        throw new BadRequestException('The contest name can not be empty');
    }

    const start_date_with_dt = new Date(start_date);
    const end_date_with_dt = new Date(end_date);

    if (start_date_with_dt >= end_date_with_dt) {
        throw new BadRequestException('The start date must be before the end date');
    }

    const filtered_test_cases = test_cases.filter(
        (t) => ![undefined, ''].includes(t.input) || ![undefined, ''].includes(t.output)
    );

    if (filtered_test_cases.length < 1) {
        throw new BadRequestException('At least one valid test case must be provided');
    }

    return {
        name,
        description,
        start_date: start_date_with_dt,
        end_date: end_date_with_dt,
        test_cases: filtered_test_cases
    };
};
