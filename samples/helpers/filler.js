function paragraph(label, count = 4) {
    const sentence =
        `${label}. This paragraph is generated from the formal document engine ` +
        `sample suite. It is intentionally repetitive so that pagination, spacing, ` +
        `and typography can be evaluated under realistic multi-page conditions`;

    return Array.from({ length: count }, () => sentence).join(" ") + ".";
}

function tableRows(count, prefix = "Row") {
    return Array.from({ length: count }, (_, index) => {
        const n = index + 1;

        return [
            `${prefix} ${n}`,
            `Description for ${prefix.toLowerCase()} ${n}. This text verifies ` +
            `wrapped table cells and consistent row spacing.`,
            `Source ${n}`
        ];
    });
}

module.exports = {
    paragraph,
    tableRows
};