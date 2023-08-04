/*!
  Quizfreely (quizfreely.ehan.dev)
  Copyright (c) 2022-present Ehan Ahamed and contributors
  Licensed under the UPL-1.0 License
  https://quizfreely.ehan.dev/license
*/

var buttons = {
  load: {
    make: function () {
      edit.make();
      sections.changeTo("edit");
    },
  },
  open: {
    edit: function () {
      edit.load();
      sections.changeTo("edit");
      //alerts.clear();
    },
    flashcards: function () {
      sessionData.flashcards.index = 0;
      flashcards.load(sessionData.flashcards.index);
      sections.changeTo("flashcards");
    },
  },
  edit: {
    add: function () {
      edit.add();
    },
    done: function () {
      /* the snippet below usually has sessionData.studySetData = ..., in this case, that line is in edit.js's edit.save() funciton, which is called/ran below */
      edit.save();
      /* line below saves settings into the json after edit.save() updates the json */
      sessionData.studySetData.settings = studySet.getSettings();
      isStudySetCopy(sessionData.studySetData.name, function (isStudySetCopy) {
        if (isStudySetCopy === true) {
          ui.elements.edit.studySetIsCopy.classList.remove("hide");
        } else if (isStudySetCopy === false) {
          /* is also here (1) */
          studySet.open();
          /* NOT including next line (1) */
          document.getElementById("mainActionsSave").classList.remove("hide");
        }
      });
    },
  },
  save: {},
  flashcards: {
    flip: function () {
      flashcards.flip();
    },
    prev: function () {
      flashcards.prev();
    },
    next: function () {
      flashcards.next();
    },
  },
};
