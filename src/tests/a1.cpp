//#include <boost/icl/interval.hpp>
//#include <boost/icl/closed_interval.hpp>
#include <boost/icl/interval_map.hpp>
//#include <boost/icl/separate_interval_set.hpp>
//#include <boost/icl/concept/interval_associator.hpp>
#include <QVector>
#include <QtCore>
#include <QList>
#include <QMap>

namespace bicl = boost::icl;

using namespace std;



template <typename T>
T Poisson_cdist(int k, T lambda)
{
    T res = 1.0;
    for(int i=0; i<k; i++){
        T log_cur_p = -lambda + i*log(lambda) ;
        for(int j=1; j<=i; j++)//factorial
        {
            log_cur_p = log_cur_p - log((T)j);
        }
        res -= exp(log_cur_p);
    }
    return res;
}

template <class T>
bool operator<=(QList<T> &s, QList<T> &s1)
{
 return s.size()<=s1.size();
}

template <class T>
bool operator>=(QList<T> &s, QList<T> &s1)
{
 return s.size()>=s1.size();
}
/*
template <class T>
bool operator>(QList<T> &s, QList<T> &s1)
{
 return s.size()>s1.size();
}

template <class T>
bool operator<(QList<T> &s, QList<T> &s1)
{
 return s.size()<s1.size();
}

template <class T>
bool operator==(QList<T> &s, QList<T> &s1)
{
 return s.size()==s1.size();
}
*/


#if 0
[0][00:18:05] ISO: [ 11874 : 12227 ],size: 1  chr: "chr1"  o: "chr1" 
[0][00:18:05] ISO: [ 12613 : 12721 ],size: 1  chr: "chr1"  o: "chr1" 
[0][00:18:05] ISO: [ 13221 : 14409 ],size: 1  chr: "chr1"  o: "chr1" 
[0][00:18:05] ISO: [ 69091 : 70008 ],size: 1  chr: "chr1"  o: "chr1" 
[0][00:18:05] ISO: [ 323892 : 324060 ],size: 3  chr: "chr1"  o: "chr1" 
[0][00:18:05] ISO: [ 324288 : 324345 ],size: 3  chr: "chr1"  o: "chr1" 
[0][00:18:05] ISO: [ 324439 : 326938 ],size: 3  chr: "chr1"  o: "chr1" 
[0][00:18:05] ISO: [ 326938 : 327036 ],size: 2  chr: "chr1"  o: "chr1" 
[0][00:18:05] ISO: [ 327036 : 328581 ],size: 3  chr: "chr1"  o: "chr1" 
[0][00:18:05] ISO: [ 367659 : 368597 ],size: 2  chr: "chr1"  o: "chr1" 
[0][00:18:05] ISO: [ 192981496 : 192985525 ],size: 2  chr: "chr1"  o: "chr1" 
[0][00:18:05] ISO: [ 192987535 : 192987950 ],size: 2  chr: "chr1"  o: "chr1" 
[0][00:18:05] ISO: [ 192989437 : 192989511 ],size: 1  chr: "chr1"  o: "chr1" 
[0][00:18:05] ISO: [ 192990227 : 192990325 ],size: 4  chr: "chr1"  o: "chr1" 
[0][00:18:05] ISO: [ 192992056 : 192992166 ],size: 4  chr: "chr1"  o: "chr1" 
[0][00:18:05] ISO: [ 192992166 : 192992169 ],size: 1  chr: "chr1"  o: "chr1" 
[0][00:18:05] ISO: [ 192992974 : 192993076 ],size: 4  chr: "chr1"  o: "chr1" 
[0][00:18:05] ISO: [ 192997215 : 192997278 ],size: 4  chr: "chr1"  o: "chr1" 
[0][00:18:05] ISO: [ 192998309 : 192998439 ],size: 4  chr: "chr1"  o: "chr1" 
[0][00:18:05] ISO: [ 192998518 : 192998579 ],size: 4  chr: "chr1"  o: "chr1" 
[0][00:18:05] ISO: [ 192998662 : 192998787 ],size: 4  chr: "chr1"  o: "chr1" 
[0][00:18:05] ISO: [ 193018876 : 193018981 ],size: 4  chr: "chr1"  o: "chr1" 
[0][00:18:05] ISO: [ 193020884 : 193020947 ],size: 4  chr: "chr1"  o: "chr1" 
[0][00:18:05] ISO: [ 193028315 : 193028523 ],size: 4  chr: "chr1"  o: "chr1" 
#endif

int main(void)
{

bicl::interval_map<int,QList<int*> > a,b,c; 

QList<int*> c1,c2,c3;
int ccc=1;
int* cc=&ccc;
c1.append(cc);
c2.append(cc);
c2.append(cc);
c3.append(cc);

a+=make_pair(bicl::discrete_interval<int>::closed((int)11874,(int)12227),c1);
a+=make_pair(bicl::discrete_interval<int>::closed((int)12613,(int)12721),c1);
a+=make_pair(bicl::discrete_interval<int>::closed((int)13221,(int)14409),c1);
a+=make_pair(bicl::discrete_interval<int>::closed((int)69091,(int)70008),c1);
b+=make_pair(bicl::discrete_interval<int>::closed((int)323892,(int)324060),c2);
b+=make_pair(bicl::discrete_interval<int>::closed((int)324288,(int)324345),c2);
b+=make_pair(bicl::discrete_interval<int>::closed((int)324439,(int)326938),c2);
b+=make_pair(bicl::discrete_interval<int>::closed((int)326938,(int)327036),c2);
b+=make_pair(bicl::discrete_interval<int>::closed((int)327036,(int)328581),c2);
b+=make_pair(bicl::discrete_interval<int>::closed((int)367659,(int)368597),c2);
//b+=make_pair(bicl::discrete_interval<int>::closed((int),(int)),c3);

//c=a&b;

//b=b-c;

   bicl::interval_map<int, QList<int*> >::iterator it = b.begin();
    cout << "----- History of party guests -------------------------\n";
    while(it != b.end())
    {
      bicl::discrete_interval<int> itv  = it->first;
      bool intersect=bicl::intersects(itv,b.rbegin()->first);
        // Who is at the party within the time interval 'when' ?
        QList<int*> who = (*it++).second;
        cout << itv << ": " << who.size() << " b:"<<intersect<<endl;
    }






return 0;

for(int i=0;i<10;i++)
 cout <<i<<":"<<Poisson_cdist<double>(i,(100.0/2000.0)*10.0) << endl;





QString str="GAPDH STAT6 TPI1 SPSB2";

if(str.contains("STAT6"))
 cout <<"!!!" << endl;




/*cout<<"a:"<<a<<endl;
cout<<"b:"<<b<<endl;

c=a&b;


    it = c.begin();
    cout << "----- cccccccccccccccccccc -------------------------\n";
    while(it != c.end())
    {
      bicl::discrete_interval<int> itv  = it->first;
        // Who is at the party within the time interval 'when' ?
        int who = (*it++).second;
        cout << itv << ": " << who << endl;
    }


if(a==b)
{
        cout << "equal" << endl;
}
else
{
        cout << "Nequal" << endl;
}

//c=d;

return 0; 
*/
}