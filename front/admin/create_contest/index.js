import * as auth from '/helpers/auth.js';
import * as http from '/helpers/http.js';

(async () => {
    const is_staff = await auth.is_staff();
    if (!is_staff) {
        location.replace('/');
    }
    const contests_elements = {
        name: document.getElementById('name'),
        description: document.getElementById('description'),
        test_cases_area: document.getElementById('test_cases_area'),
        start_date: document.getElementById('start_date'),
        end_date: document.getElementById('end_date'),
        error: document.getElementById('error')
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
    });

    document.getElementById('submit').addEventListener('click', async (e) => {
        e.preventDefault();
        const response = await http.post('/admin/create_contest', {
            name: contests_elements.name.value,
            description: contests_elements.description.value,
            start_date: contests_elements.start_date.value,
            end_date: contests_elements.end_date.value,
            test_cases: test_cases_elements.map((e) => {
                return { input: e.input.value, output: e.output.value };
            })
        });
        if (response.status === 400) {
            contests_elements.error.innerText = await response.text();
            return;
        }
        if (response.status >= 400) {
            contests_elements.error.innerText = 'An error has occurred';
            return;
        }
        location.replace('/');
    });
})();
