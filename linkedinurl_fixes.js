// Script to ensure linkedin string end with slash
const newE = experts.map(function(elem){
    if(elem.linkedin && elem.linkedin.charAt(elem.linkedin.length-1)!="/"){
        elem.linkedin+="/"
    }
    return elem;
})

copy(newE);
