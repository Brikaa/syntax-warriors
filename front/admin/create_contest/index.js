import * as auth from '/helpers/auth.js';

(async () => {
    const is_authorized = await auth.is_authorized();
    if (!is_authorized) {
        location.replace('/');
    }
    const contests_elements = {
        name: document.getElementById('name'),
        description: document.getElementById('description'),
        test_cases_area: document.getElementById('test_cases_area'),
        start_date: document.getElementById('start_date'),
        end_date: document.getElementById('end_date')
    };

    const test_cases_elements = [];
    document.getElementById('add_test_case').addEventListener('click', (e) => {
        const add_new_line = (test_cases_area) => {
            test_cases_area.appendChild(document.createElement('br'));
        };

        const create_text_area = (test_cases_area) => {
            const text_area = document.createElement('textarea');
            text_area.setAttribute('rows', '5');
            test_cases_area.appendChild(text_area);
            return text_area;
        };

        const test_cases_area = contests_elements.test_cases_area;
        e.preventDefault();

        const input_label = document.createElement('label');
        input_label.innerText = 'Input';
        test_cases_area.appendChild(input_label);
        add_new_line(test_cases_area);
        const input_area = create_text_area(test_cases_area);
        add_new_line(test_cases_area);

        const output_label = document.createElement('label');
        output_label.innerText = 'Output';
        test_cases_area.appendChild(output_label);
        add_new_line(test_cases_area);
        const output_area = create_text_area(test_cases_area);
        add_new_line(test_cases_area);
        add_new_line(test_cases_area);

        test_cases_elements.push({
            input: input_area,
            output: output_area
        });
        console.log(test_cases_elements);
    });
    document.getElementById('submit').addEventListener('click', (e) => {
        e.preventDefault();
        console.log(contests_elements.name.value);
    });
})();
