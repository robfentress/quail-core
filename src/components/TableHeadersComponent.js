const DOM = require('DOM');

var scopeValues = ['row', 'col', 'rowgroup', 'colgroup'];

function isColumnHeader (tableMap, cell, x, y) {
  var height = cell.getAttribute('rowspan') || 1;
  var scope = cell.getAttribute('scope');
  if (scope === 'col') {
    return true;
  }
  else if (scopeValues.indexOf(scope) !== -1) {
    return false;
  }

  for (var i = 0; i < height * tableMap[y].length - 1; i += 1) {
    var currCell = tableMap[y + i % height][~~(i / height)];
    if (DOM.is(currCell, 'td')) {
      return false;
    }
  }
  return true;
}

function isRowHeader (tableMap, cell, x, y) {
  var width = cell.getAttribute('colspan') || 1;
  var scope = cell.getAttribute('scope');

  if (scope === 'row') {
    return true;
  }
  else if (scopeValues.indexOf(scope) !== -1 ||
  isColumnHeader(tableMap, cell, x, y)) {
    return false;
  }

  for (var i = 0; i < width * tableMap.length - 1; i += 1) {
    var currCell = tableMap[~~(i / width)][x + i % width];
    if (DOM.is(currCell, 'td')) {
      return false;
    }
  }
  return true;
}

function scanHeaders (tableMap, x, y, deltaX, deltaY) {
  var headerList = [];
  var cell = tableMap[y][x];
  var opaqueHeaders = [];
  var inHeaderBlock;
  var headersFromCurrBlock;

  if (DOM.is(cell, 'th')) {
    headersFromCurrBlock = [{
      cell: cell,
      x: x,
      y: y
    }];

    inHeaderBlock = true;
  }
  else {
    inHeaderBlock = false;
    headersFromCurrBlock = [];
  }

  for (; x >= 0 && y >= 0; x += deltaX, y += deltaY) {
    var currCell = tableMap[y][x];
    var dir = (deltaX === 0 ? 'col' : 'row');

    if (DOM.is(currCell, 'th')) {
      inHeaderBlock = true;
      headersFromCurrBlock.push({
        cell: currCell,
        x: x,
        y: y
      });
      var blocked = false;
      if (deltaY === -1 && isRowHeader(tableMap, currCell, x, y) ||
      deltaX === -1 && isColumnHeader(tableMap, currCell, x, y)) {
        blocked = true;

      }
      else {
        opaqueHeaders.forEach(function (opaqueHeader) {
          var currSize = +currCell.getAttribute(dir + 'span') || 1;
          var opaqueSize = +DOM.getAttribute(opaqueHeader.cell, dir + 'span') || 1;
          if (currSize === opaqueSize) {
            if (deltaY === -1 && opaqueHeader.x === x ||
                deltaX === -1 && opaqueHeader.y === y) {
              blocked = true;
            }
          }
        });
      }
      if (blocked === false) {
        headerList.push(currCell);
      }

    }
    else if (DOM.is(currCell, 'td') && inHeaderBlock === true) {
      inHeaderBlock = false;
      opaqueHeaders.push(headersFromCurrBlock);
      headersFromCurrBlock = [];
    }
  }
  return headerList;
}

/**
 * Get header cells based on the headers getAttributeibute of a cell
 */
function getHeadersFromAttr (cell) {
  var table = DOM.parents(cell).find((parent) => DOM.is(parent, 'table'))[0];
  var ids = cell.getAttribute('headers').split(/\s/);
  var headerCells = [];
  // For each IDREF select an element with that ID from the table
  // Only th/td cells in the same table can be headers
  ids.forEach(function (id) {
    headerCells.push(DOM.scry('th#' + id + ', td#' + id, table));
  });
  return headerCells;
}

function findCellInTableMap (tableMap, cell) {
  var i = 0;
  var y = 0;
  var x;
  // Locate the x and y coordinates of the current cell
  while (x === undefined) {
    if (tableMap[y] === undefined) {
      return;
    }
    else if (tableMap[y][i] === cell[0]) {
      x = i;

    }
    else if (i + 1 === tableMap[y].length) {
      y += 1;
      i = 0;
    }
    else {
      i += 1;
    }
  }
  return {x: x, y: y};
}

function getHeadersFromScope (cell, tableMap) {
  var i;
  var headerCells = [];
  var coords = findCellInTableMap(tableMap, cell);

  // Grab the width and height, undefined, invalid or 0 become 1
  var height = +cell.getAttribute('rowspan') || 1;
  var width = +cell.getAttribute('colspan') || 1;

  for (i = 0; i < width; i++) {
    headerCells.push(
      scanHeaders(tableMap, coords.x + i, coords.y, 0, -1)
    );
  }

  for (i = 0; i < height; i++) {
    headerCells.push(
      scanHeaders(tableMap, coords.x, coords.y + i, -1, 0)
    );
  }
  return headerCells;
}

function getHeadersFromGroups (cell, tableMap) {
  var cellCoords = findCellInTableMap(tableMap, cell);
  var headers = [];
  let parents = DOM.parents(cell);
  let thead = parents.find((parent) => DOM.is(parent, 'thead'));
  let tbody = parents.find((parent) => DOM.is(parent, 'tbody'));
  let tfoot = parents.find((parent) => DOM.is(parent, 'tfoot'));
  DOM.scry(
    'th[scope=rowgroup]',
    [thead, tbody, tfoot]
  ).forEach(function (element) {
    var headerCoords = findCellInTableMap(tableMap, element);
    if (headerCoords.x <= cellCoords.x && headerCoords.y <= cellCoords.y) {
      headers.push(element);
    }
  });

  // TODO colgroups

}
var TableHeadersComponent = {
  getTableMap: function (table) {
    var map = [];
    DOM.scry('tr', table).forEach(function (element, y) {
      if (typeof map[y] === 'undefined') {
        map[y] = [];
      }
      var row = map[y];
      DOM.children(element).forEach(function (cell) {
        var x;
        var i, il;

        // Grab the width and height, undefined, invalid or 0 become 1
        var height = +cell.getAttribute('rowspan') || 1;
        var width = +cell.getAttribute('colspan') || 1;
        // Make x the first undefined cell in the row
        for (i = 0, il = row.length; i <= il; i += 1) {
          if (x === undefined && row[i] === undefined) {
            x = i;
          }
        }
        // add 'this' to each coordinate in the map based on width and height
        for (i = 0, il = width * height; i < il; i += 1) {
          // Create a new row if it doesn't exist yet
          if (map[y + ~~(i / width)] === undefined) {
            map[y + ~~(i / width)] = [];
          }
          // Add the cell to the correct x / y coordinates
          map[y + ~~(i / width)][x + (i % width)] = cell;
        }
      });

    });
    return map;
  },

  tableHeaders: function (elements) {
    var headers = [];
    elements.forEach(function (element) {
      if (!DOM.is(element, 'td, th')) {
        return;
      }

      if (element.hasAttribute('headers')) {
        headers.push(getHeadersFromAttr(element));

      }
      else {
        var table = DOM.closest(element, 'table');
        var map = TableHeadersComponent.getTableMap(table);
        headers.push(getHeadersFromScope(element, map));
        headers.push(getHeadersFromGroups(element, map));
      }
    });
    return headers.filter((header) => /\S/.test(header.innerHTML));
  }
};

module.exports = TableHeadersComponent;
