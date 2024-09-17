import { useEffect } from "react";


export function useKey(key, action) {
    useEffect(function () {
        function Callback(e) {
            if (e.code.toLowerCase() === key.toLowerCase()) {
                action();
            }
        }

        document.addEventListener("keydown", Callback);
        return function () {
            document.removeEventListener("keydown", Callback);
        }
    }, [action, key])

}