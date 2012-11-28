//#include <boost/icl/interval.hpp>
//#include <boost/icl/closed_interval.hpp>
#include <boost/icl/interval_map.hpp>
//#include <boost/icl/separate_interval_set.hpp>
//#include <boost/icl/concept/interval_associator.hpp>
#include <QVector>
#include <QtCore>

namespace bicl = boost::icl;

using namespace std;


int main(void)
{

QVector<QVector< float> > m,m1,m2;
m.resize(2);
m[0]<<1.0<<2.0<<3.0<<4.0<<5.0;
m[1]<<10.0<<20.0<<30.0<<40.0<<50.0;
m1=m;
m[0][2]=3.3;

for(int i=0;i<m.size(); i++)
 for(int j=0; j<m[i].size();j++)
 {
        cout << m[i][j] << " =?= " << m1[i][j] << endl;
 }
return 0;
//------------------------------------------------------------------
bicl::interval_map<int,int> a,b,c; 
a+=make_pair(bicl::discrete_interval<int>::closed((int)1,(int)3),1);

//bicl::interval_map<int,int> b; 

b+=make_pair(bicl::discrete_interval<int>::closed((int)2,(int)4),1);
b+=make_pair(bicl::discrete_interval<int>::closed((int)6,(int)7),1);

//bicl::interval_map<int,int> c;

bicl::interval_set<int> d;

//bicl::interval_set<int,int> e;



//            a+=make_pair(bicl::discrete_interval<int>::closed(left,right),1);

    bicl::interval_map<int, int>::iterator it = b.begin();
    cout << "----- History of party guests -------------------------\n";
    while(it != b.end())
    {
      bicl::discrete_interval<int> itv  = it->first;
        // Who is at the party within the time interval 'when' ?
        int who = (*it++).second;
        cout << itv << ": " << who << endl;
    }

a+=make_pair(bicl::discrete_interval<int>::closed((int)2,(int)4),1);

b+=make_pair(bicl::discrete_interval<int>::closed((int)1,(int)3),1);;

cout<<"a:"<<a<<endl;
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
}