import numpy as np, sys
def load_obj(p):
    V=[];VT=[];F=[];FT=[]
    for line in open(p):
        if line.startswith('v '): V.append([float(x) for x in line.split()[1:4]])
        elif line.startswith('vt '): VT.append([float(x) for x in line.split()[1:3]])
        elif line.startswith('f '):
            ps=line.split()[1:]
            F.append([int(q.split('/')[0])-1 for q in ps])
            FT.append([int(q.split('/')[1])-1 if len(q.split('/'))>1 and q.split('/')[1] else -1 for q in ps])
    return np.array(V),np.array(VT),F,FT
def load_target(p, n):
    d=np.zeros((n,3))
    for l in open(p):
        if not l.strip() or l.startswith('#'): continue
        t=l.split()
        i=int(t[0]); d[i]=[float(t[1]),float(t[2]),float(t[3])]
    return d
