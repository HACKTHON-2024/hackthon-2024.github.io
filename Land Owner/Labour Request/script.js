// Initialize datepicker
document.addEventListener('DOMContentLoaded', function () {
    const datepicker = document.getElementById('datepicker');
    datepicker.addEventListener('focus', function () {
        datepicker.type = 'date';
    });

    datepicker.addEventListener('blur', function () {
        if (!datepicker.value) {
            datepicker.type = 'text';
        }
    });
});
