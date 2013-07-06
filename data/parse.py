import sys

def _vec2d_dist(p1, p2):
    return (p1[0] - p2[0])**2 + (p1[1] - p2[1])**2


def _vec2d_sub(p1, p2):
    return (p1[0]-p2[0], p1[1]-p2[1])


def _vec2d_mult(p1, p2):
    return p1[0]*p2[0] + p1[1]*p2[1]


def ramerdouglas(line, dist):
    """Does Ramer-Douglas-Peucker simplification of a line with `dist`
    threshold.

    `line` is a list-of-tuples, where each tuple is a 2D coordinate

    Usage is like so:

    >>> myline = [(0.0, 0.0), (1.0, 2.0), (2.0, 1.0)]
    >>> simplified = (myline, dist = 1.0)
    """

    if len(line) < 3:
        return line

    begin, end = line[0], line[-1]

    distSq = []
    for curr in line[1:-1]:
        tmp = (
            _vec2d_dist(begin, curr) - _vec2d_mult(_vec2d_sub(end, begin), _vec2d_sub(curr, begin)) ** 2 / _vec2d_dist(begin, end))
        distSq.append(tmp)

    maxdist = max(distSq)
    if maxdist < dist ** 2:
        return [begin, end]

    pos = distSq.index(maxdist)
    return (ramerdouglas(line[:pos + 2], dist) + 
            ramerdouglas(line[pos + 1:], dist)[1:])

def toArrayOfArray(a):
    r = []
    for item in a:
        r.append([item[0],item[1]])

    return r

inFile = open(sys.argv[1],'r')

tids = {}
for line in inFile:
    data = line.strip().split('\t')
    ref = data[0]
    featureType = data[2]
    start = int(data[3])
    end = int(data[4])
    length = end - start + 1
    strand = data[6]
    tid = data[-1].split(';')[1].split()[1][1:-1]

    if featureType == 'exon':
        if not tids.has_key(tid):
            tids[tid] = []
            tids[tid].append((ref,strand,start))

        tids[tid].append((start - tids[tid][0][2],end - start + 1))

refs = {}
out = ''
for tid, data in tids.items():
    ref = data[0][0]
    start = data[0][2]
    end = data[0][2] + data[-1][0] + data[-1][1]

    if not refs.has_key(ref):
        refs[ref] = []

    refs[ref].append((start,'s'))
    refs[ref].append((end,'e'))

    out += tid + "|" + data[0][0] + "|" + data[0][1] +  "|" + str(data[0][2]) + "|" + ';'.join([str(x[0]) + ',' + str(x[1]) for x in data[1:]]) + "~"

for ref, data in refs.items():
    data.sort(key = lambda x : x[0])
    
    current = 0
    final = {}
    for coord in data:
        if coord[1] == 's':
            current += 1
        else:
            current -= 1

        final[coord[0]] = current

    pts = final.items()
    pts.append([0,0])
    pts.append([249250621,0])
    pts.sort(key = lambda x : x[0])

print 'var pts = ' + str(toArrayOfArray(pts)) + ';'
print 'var data = "' + out[:-1] + '";'