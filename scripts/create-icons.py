"""Generate the original geometric Super Todo mark; no external artwork."""
from pathlib import Path
import struct, zlib, math

def png(path,size,transparent=False):
    points=[(.27,.51),(.43,.67),(.75,.34)]
    segments=list(zip(points,points[1:]))
    def distance(x,y,a,b):
        vx,vy=b[0]-a[0],b[1]-a[1]
        f=max(0,min(1,((x-a[0])*vx+(y-a[1])*vy)/(vx*vx+vy*vy)))
        return math.hypot(x-a[0]-f*vx,y-a[1]-f*vy)
    rows=[]
    for j in range(size):
        row=bytearray([0])
        for i in range(size):
            d=min(distance((i+.5)/size,(j+.5)/size,a,b) for a,b in segments)
            alpha=max(0,min(1,(.042-d)*size+.5))
            if transparent: row.extend((255,255,255,round(255*alpha)))
            else: row.extend((round(113+142*alpha),round(101+154*alpha),round(232+23*alpha),255))
        rows.append(bytes(row))
    def chunk(name,data):return struct.pack('!I',len(data))+name+data+struct.pack('!I',zlib.crc32(name+data)&0xffffffff)
    Path(path).write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',size,size,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(b''.join(rows),9))+chunk(b'IEND',b''))
png('assets/icon.png',1024)
png('assets/adaptive-foreground.png',1024,True)
png('assets/favicon.png',64)
