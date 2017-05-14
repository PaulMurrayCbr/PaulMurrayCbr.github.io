$fn=24;

mintolerance = 0;
maxtolerance = 1;

module t(tt=0) { 
difference() {
cylinder(r=8, h=10);
translate([0,0,-5]) cylinder(r=5, h=20);    
}
cylinder(r=5-tt,h=10);
}

for(i=[0:4]) {
    for(j=[0:4]) {
        z = i*5 +j;
        
translate([j*15,i*15,0]) t((maxtolerance-mintolerance)/25*z+mintolerance);
}
}