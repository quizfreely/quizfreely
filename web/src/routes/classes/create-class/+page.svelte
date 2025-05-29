<script>
    import { goto } from "$app/navigation";
    import IconBackArrow from "$lib/icons/BackArrow.svelte";
    import IconCheckmark from "$lib/icons/Checkmark.svelte";
    let name = $state("");
</script>
<style>
.reasonable-title-size {
    font-size: 1.2rem;
    width: 40vw;
}
.reasonable-title-size::placeholder {
    font-size: 1.2rem;
}
</style>
<div class="grid page">
    <div class="content">
<div class="flex">
    <a href="/classes" class="button faint">
        <IconBackArrow /> Back
    </a>
</div>
        <div>
            <input type="text" class="reasonable-title-size" placeholder="Class name" bind:value={name}>
        </div>
        <div>
            <button onclick={() => {
                fetch("/classes/api/graphql", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        query: `mutation createCourse($name: String!) {
                            createCourse(name: $name) {
                                id
                            }
                        }`,
                        variables: {
                            "name": name
                        }
                    })
                }).then(function (result) {
                    result.json().then(function (resultJson) {
                        if (resultJson?.data?.createCourse?.id) {
                            /* returns created course. we need its id */
                            fetch("/classes/api/graphql", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    query: `mutation createClass($name: String!, $courseId: ID!) {
                                        createClass(name: $name, courseId: $courseId) {
                                            id
                                        }
                                    }`,
                                    variables: {
                                        "name": name,
                                        "courseId": resultJson.data.createCourse.id
                                    }
                                })
                            }).then(function (result2) {
                                result2.json().then(function (resultJson2) {
                                    if (resultJson2?.data?.createClass?.id) {
                                        /* returns created class. we use its id */
                                        goto(`/classes/c/${resultJson2.data.createClass.id}`);
                                    } else {
                                        alert("Error after successful API response");
                                    }
                                }).catch(function (error) {
                                    console.error(
                                        "Error parsing API response as JSON in createClass",
                                        error
                                    );
                                    alert("Error in createClass JSON");
                                })
                            }).catch(function (error) {
                                console.error(
                                    "Error creating class",
                                    error
                                )
                                alert("Error in createClass")
                            })
                        } else {
                            alert("Error after successful API response");
                        }
                    }).catch(function (error) {
                        console.error(
                            "Error parsing API response as JSON in createCourse",
                            error
                        );
                        alert("Error in createCourse JSON");
                    })
                }).catch(function (error) {
                    console.error(
                        "Error creating course",
                        error
                    )
                    alert("Error in createCourse")
                })
            }}><IconCheckmark></IconCheckmark> Create</button>
        </div>
</div>
</div>

