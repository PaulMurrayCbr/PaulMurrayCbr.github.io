$fn=24;

maxtolerance = 1;
mintolerance = maxtolerance/25;

h1 = 5;
h2 = 10;

inner = 5;
outer = 7.5;

spacing = outer + inner;

module t(tt=0) { 
    difference() {
        cylinder(r=outer, h=h1);
        translate([0,0,-h1]) cylinder(r=inner, h=h1*4);    
    }
    cylinder(r=inner-tt,h=h2);
}

for(i=[0:4]) {
    for(j=[0:4]) {
        z = i*5 +j;
        translate([j*spacing+outer,i*spacing+outer,0]) 
        t((maxtolerance-mintolerance)/25*z+mintolerance);
    }
}