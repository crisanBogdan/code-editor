export function stripHtmlTags(text = ''): string {
    const openTagRE = new RegExp(/<[\w]+[\s\w="';,:-]*>/);
    const closeTagRE = new RegExp(/<\/[\w]+>/);

    let result;

    while ((result = openTagRE.exec(text))) {
        text = text.replace(result[0], '');
    }
    while ((result = closeTagRE.exec(text))) {
        text = text.replace(result[0], '');
    }

    return text;
}
