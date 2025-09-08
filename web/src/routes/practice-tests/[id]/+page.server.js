import { env } from "$env/dynamic/private";

export async function load({cookies, params}) {
    try {
        const respRaw = await fetch(env.API_URL + "/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${cookies.get("auth")}`
            },
            body: JSON.stringify({
                query: `query viewPracticeTest($id: ID!) {
    authed
    authedUser {
        id
        username
        displayName
    }
    practiceTest(id: $id) {
        id
        timestamp
        studysetId
        questionsCorrect
        questionsTotal
        questions {
            questionType
            mcq {
                term {
                    id
                    term
                    def
                }
                answerWith
                correct
                answeredTerm {
                    id
                    term
                    def
                }
                distractors {
                    id
                    term
                    def
                }
                correctChoiceIndex
            }
            trueFalseQuestion {
                term {
                    id
                    term
                    def
                }
                answerWith
                correct
                answeredBool
                distractor {
                    id
                    term
                    def
                }
            }
        }
    }
}`,
                variables: {
                    id: params.id
                }
            })
        });
        const resp = await respRaw.json();
        if (resp?.data == null || resp?.errors != null) {
            console.log("Error in cloud practice test (viewing) load func api request. Response: ", resp);
        }
        return {
            practiceTestId: params.id,
            practiceTest: resp?.data?.practiceTest,
            studysetId: resp?.data?.practiceTest?.studysetId,
            authed: resp?.data?.authed,
            authedUser: resp?.data?.authedUser,
            settingsDateTimeFmtHours: cookies.get(
              "settingsdatetimeformathours"
            )
        }
    } catch (err) {
        console.error("Error in cloud practice test (viewing) load func: ", err);
        return {
          practiceTestId: params.id,
          authed: false,
          settingsDateTimeFmtHours: cookies.get(
            "settingsdatetimeformathours"
          )
        }
    }
}
