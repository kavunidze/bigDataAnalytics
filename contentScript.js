chrome.runtime.onMessage.addListener((formData) => {
    console.log("working")
    fillForm('[placeholder="Passenger mobile number"]', formData.pContact);
    fillForm("#aaa1", formData.pAddress);
    formData.passengerDetails.forEach(e => {
        fillForm('[placeholder="Passenger Name"]', e.username);
        fillForm('[placeholder="Age"]', e.age);
        fillForm('[formcontrolname="passengerGender"]', e.gender);
        fillForm('[formcontrolname="passengerBerthChoice"]', e.berth);
    })

    function fillForm(elem, value) {
        const event = new Event("input", { bubbles: true });
        try {
            document.querySelector(elem).value = value;
            document.querySelector(elem).dispatchEvent(event);
        } catch (error) {
            console.log(error)
        }
    }
})