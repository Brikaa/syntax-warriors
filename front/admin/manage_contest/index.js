import * as auth from '/helpers/auth.js';
import * as http from '/helpers/http.js';

(async () => {
    const is_staff = await auth.is_staff();
    if (!is_staff) {
        location.replace('/');
    }

    const url_params = new URLSearchParams(location.search);
    let contest = null;
    let test_cases = null;
    if (url_params.has('id')) {
        const contest_req = await http.post(`/admin/get_contest/${url_params.get('id')}`);
        if (contest_req.status >= 400) {
            alert('An error has occurred');
            return location.replace('/');
        }
        const contest_json = await contest_req.json();
        contest = contest_json.contest;
        test_cases = contest_json.test_cases;
    }

    const contest_elements = {
        name: document.getElementById('name'),
        description: document.getElementById('description'),
        test_cases_area: document.getElementById('test_cases_area'),
        start_date: document.getElementById('start_date'),
        end_date: document.getElementById('end_date'),
        error: document.getElementById('error'),
        submit: document.getElementById('submit')
    };

    const test_cases_elements = [];
    const add_test_case_element = () => {
        const add_new_line = (test_cases_area) => {
            test_cases_area.appendChild(document.createElement('br'));
        };

        const create_text_area = (test_cases_area) => {
            const text_area = document.createElement('textarea');
            text_area.setAttribute('rows', '5');
            test_cases_area.appendChild(text_area);
            return text_area;
        };

        const test_cases_area = contest_elements.test_cases_area;
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

        const test_case_element = {
            input: input_area,
            output: output_area
        };
        test_cases_elements.push(test_case_element);
        return test_case_element;
    };
    document.getElementById('add_test_case').addEventListener('click', (e) => {
        e.preventDefault();
        add_test_case_element();
    });

    contest_elements.submit.addEventListener('click', async (e) => {
        e.preventDefault();
        const post_url = contest === null ? 'create_contest' : 'update_contest';
        const response = await http.post(`/admin/${post_url}`, {
            name: contest_elements.name.value,
            description: contest_elements.description.value,
            start_date: contest_elements.start_date.value,
            end_date: contest_elements.end_date.value,
            test_cases: test_cases_elements.map((e) => {
                return { input: e.input.value, output: e.output.value };
            })
        });
        if (response.status === 400) {
            contest_elements.error.innerText = await response.text();
            return;
        }
        if (response.status >= 400) {
            contest_elements.error.innerText = 'An error has occurred';
            return;
        }
        location.replace('/');
    });

    if (contest !== null) {
        contest_elements.name.value = contest.name;
        contest_elements.description.value = contest.description;
        contest_elements.start_date.value = contest.start_date.slice(0, -5);
        contest_elements.end_date.value = contest.end_date.slice(0, -5);
        for (const test_case of test_cases) {
            const test_case_element = add_test_case_element();
            test_case_element.input.value = test_case.input;
            test_case_element.output.value = test_case.output;
        }
        contest_elements.submit.value = 'Update contest';
    }
})();
