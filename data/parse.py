import sys

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
            tids[tid].append((ref,strand, start))

        tids[tid].append((start - tids[tid][0][2],end - start + 1))


out = ''
for tid, data in tids.items():
    out += tid + "|" + data[0][0] + "|" + data[0][1] +  "|" + str(data[0][2]) + "|" + ';'.join([str(x[0]) + ',' + str(x[1]) for x in data[1:]]) + "~"

print 'var data = "' + out[:-1] + '";'