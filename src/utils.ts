function cleanString(inputString: string): string {
    const regex = /[^a-z]+/gi; // Regular expression to match non-alphabetic characters
    const cleanedString = inputString.replace(regex, ''); // Replace non-alphabetic characters with an empty string
    return cleanedString.toLowerCase(); // Convert the cleaned string to lowercase
}

function makeKeyFromString(inputString: string): string {
    const tempString = cleanString(inputString)
    const originalLength = tempString.length;
    if (originalLength >= 10) {
      return tempString.substring(0, 10);
    } else {
      const fillersNeeded = 10 - originalLength;
      const fillers = '_'.repeat(fillersNeeded);
      return tempString + fillers;
    }
}

function removeHtmlTags(jsonString: string): string {
    const regex = /<(?!br\s*\/?)[^>]+>/g; // Regular expression to match HTML tags excluding <br> and <br/>
    const cleanedString = jsonString.replace(/<br\s*\/?>/g,` `); // Replace <br> tags with newline character
    return cleanedString.replace(regex, ''); // Replace HTML tags with an empty string 
}

function findTableSectionByHeader(markdown: string, header: string): string | null {
  const lines = markdown.split('\n');
  let tableStartIndex = -1;
  let tableEndIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith(header)) {
      if (tableStartIndex === -1) {
        tableStartIndex = i;
      }
    } else if (tableStartIndex !== -1) {
      if (line === '' || i === lines.length - 1) {
        tableEndIndex = i;
        break;
      }
    }
  }
  if (tableStartIndex !== -1 && tableEndIndex !== -1) {
    return lines.slice(tableStartIndex, tableEndIndex + 1).join('\n');
  } else {
    return null;
  }
}

function parseMarkdownTable(tableText: string): any[] {
  const lines = tableText.trim().split('\n');
  const headerRow = lines[0].split('|').map(cell => cell.trim()).filter(Boolean);
  const separatorRow = lines[1].split('|').map(cell => cell.trim()).filter(Boolean);
  
  const rows = lines.slice(2).map(line => {
    const cells = line.split('|').map(cell => cell.trim()).filter(Boolean);
    const rowData: any = {};
    headerRow.forEach((header, index) => {
      // Replace the matched characters with spaces
      const cleanedHeader = header.replace(/[.$\/[\]#]/g, " ");
      rowData[cleanedHeader] = cells[index];
    });
    return rowData;
  });

  return rows;
}



export {
    cleanString,
    makeKeyFromString,
    removeHtmlTags,
    parseMarkdownTable,
    findTableSectionByHeader
};
  