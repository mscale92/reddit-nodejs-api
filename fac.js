function fac(num){
    if(num === 0){
        return num = 1;
      
    }
    return (num * fac(num-1));
}

console.log(fac(4));