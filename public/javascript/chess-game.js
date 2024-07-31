
const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedpiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";

    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            const squareElement = document.createElement("div");

            squareElement.classList.add("square", (squareIndex + rowIndex) % 2 === 0 ? "light" : "dark");

            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;

            if (square) {
                const pieceEelement = document.createElement("div");
                pieceEelement.classList.add("piece", square.color === 'w' ? "white" : "black");
                
                pieceEelement.innerHTML = getPieceUnicode(square) ;
                pieceEelement.draggable = square.color === playerRole;

                pieceEelement.addEventListener("dragstart", (e) => {
                    if (pieceEelement.draggable) {
                        draggedpiece = pieceEelement;
                        sourceSquare = { row: rowIndex, col: squareIndex };
                        e.dataTransfer.setData("text/plain", "");
                    }
                });

                pieceEelement.addEventListener("dragend", (e) => {
                    draggedpiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceEelement);
            }

            squareElement.addEventListener("dragover", (e) => {
                e.preventDefault();
            });
            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();
                if (draggedpiece) {
                    const targetSource = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col)
                    }

                    handleMove(sourceSquare, targetSource);
                }
            });
            boardElement.appendChild(squareElement);
        });
    });

    if(playerRole === "b"){
        boardElement.classList.add("flipped") ;
    }else{
        boardElement.classList.remove("flipped") ;
    }
};

const handleMove = (source,target) => {
    const move = {
        from: `${String.fromCharCode(97+source.col)}${8-source.row}`,
        to:  `${String.fromCharCode(97+target.col)}${8-target.row}`,
        promotion: 'q' 
    } ;
    socket.emit("move",move) ;
};

const getPieceUnicode = (piece) => {
    const unicodePieces = {
        p:"♙",
        r:"♖",
        n:"♘",
        b:"♗",
        q:"♕",
        k:"♔",
        P:"♟",
        R:"♜",
        N:"♞",
        B:"♝",
        Q:"♛",
        K:"♚"
    };

    return unicodePieces[piece.type] || "" ;
 };

 socket.on('playerRole', (role) =>{
    playerRole = role ;
    renderBoard() ;

 });

 socket.on('spectatorRole',()=>{
    playerRole = null ;
    renderBoard() ; 
 }) ;

 socket.on("boardState",function (fen){
    chess.load(fen) ;
    renderBoard() ;
 });

 socket.on("move",function (fen){
    chess.move(move) ;
    renderBoard() ;
})

renderBoard() ;
