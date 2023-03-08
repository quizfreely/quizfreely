/*!
Quizfreely (https://quizfreely.ehan.dev/)
Copyright (c) 2022-2023 Ehan Ahamed and contributors
Licensed under the UPL-1.0 License
See license file: https://src.ehan.dev/quizfreely/LICENSE.txt
*/

var importLocal = {
    init: function () {
        fileSelect.addEventListener(
            "click",
            (e) => {
                if (id) {
                    id.click();
                }
                e.preventDefault();
            },
            false
        );

    }
};
