#include <QFile>
#include <QVector>
#include <QDateTime>

using namespace std;

quint64 b_count=0;

QVector<int> merge_sort(QVector<int> in) {
    if(in.size()<=1) return in;

    QVector<int> l,r,res;
    int half=in.size()/2;
    l=merge_sort(in.mid(0,half));
    r=merge_sort(in.mid(half,-1));
    int i=0,j=0;
    while(i<l.size() && j<r.size()) {
        if(l.at(i)<r.at(j)) {
            res.append(l.at(i));
            i++;
        } else {
            b_count+=(l.size()-i);
            res.append(r.at(j));
            j++;
        }
    }
    for(int k=i; k<l.size();k++) {
        res.append(l.at(k));
    }
    for(int k=j; k<r.size();k++) {
        res.append(r.at(k));
    }
    return res;
}


int main(void)
{


    QFile _outFile;
    _outFile.setFileName("./IntegerArray1.txt");
    _outFile.open(QIODevice::ReadWrite);
    quint64 count=0;
    QVector<int> arr;
    quint64 qqq= QDateTime::currentDateTime().toMSecsSinceEpoch();
    printf("time=%llu\n",qqq);
    while(!_outFile.atEnd())
    {
        QByteArray line=_outFile.readLine();
        line=line.left(line.size()-1);
        if(line.size()>0)
            arr<<line.toInt();
    }
    _outFile.close();
    printf("time=%llu\n",QDateTime::currentDateTime().toMSecsSinceEpoch()-qqq);
    qqq= QDateTime::currentDateTime().toMSecsSinceEpoch();
    for( int i=0; i<arr.size()-1; i++)
        for( int j=i+1; j<arr.size(); j++)
        {
            if(arr[i]>arr[j])
                count++;
            //     printf("%d\n",arr[i]);
        }
    printf("time=%llu\n",QDateTime::currentDateTime().toMSecsSinceEpoch()-qqq);

    printf("count=%llu,arr.size()=%d\n",count,arr.size());
    qqq= QDateTime::currentDateTime().toMSecsSinceEpoch();
    QVector<int> qq=merge_sort(arr);
    printf("time=%llu\n",QDateTime::currentDateTime().toMSecsSinceEpoch()-qqq);
    printf("count=%llu,qq.size()=%d\n",b_count,qq.size());

    for( int i=0; i<qq.size(); i++)
        printf("%d\n",qq.at(i));


    return 0;
}
