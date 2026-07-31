function createRemainingPieces() {
    const area=document.getElementById("remaining-pieces");
    if(!area) return;
    area.innerHTML="";
    for(let i=0;i<16;i++){
        const p=document.createElement("div");
        p.className="piece-placeholder";
        p.dataset.pieceId=i;
        area.appendChild(p);
    }
}
