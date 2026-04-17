export function useFilePicker(accept = "*") {
    const pickFile = () => {
        return new Promise((resolve) => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = accept;
            input.onchange = (e) => resolve(e.target.files[0]);
            input.click();
        });
    };

    return { pickFile };
}