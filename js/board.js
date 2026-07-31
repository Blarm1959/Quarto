function createBoard() {
    const board=document.getElementById("board");
    if(!board) return;
    board.innerHTML="";
    for(let i=0;i<16;i++){
        const cell=document.createElement("div");
        cell.className="board-cell";
        cell.dataset.index=i;
        board.appendChild(cell);
    }
}
