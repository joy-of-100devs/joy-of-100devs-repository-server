(function () {
    function load() {
        window.parent.postMessage({
            type: "urlchange",
            url: window.location.href,
            $type: "dispatcher",
        }, "*");
    }

    window.addEventListener("load", load);
    window.addEventListener("message", e => {
        if (e.data.$type !== "dispatcher") return;

        switch (e.data.type) {
            case "back": {
                history.back();
                break;
            }
            case "forward": {
                history.forward();
                break;
            }
            case "refresh": {
                location.reload();
                break;
            }
        }
    })
})();
