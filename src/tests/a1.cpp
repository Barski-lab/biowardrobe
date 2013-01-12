//#include <boost/icl/interval.hpp>
//#include <boost/icl/closed_interval.hpp>
#include <boost/icl/interval_map.hpp>
//#include <boost/icl/separate_interval_set.hpp>
//#include <boost/icl/concept/interval_associator.hpp>
#include <QVector>
#include <QtCore>

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


int main(void)
{

bicl::interval_map<int,int> a,b,c; 

//------------------------------------------------------------------
a+=make_pair(bicl::discrete_interval<int>::closed((int)1,(int)3),1);
a+=make_pair(bicl::discrete_interval<int>::closed((int)2,(int)4),1);

b+=make_pair(bicl::discrete_interval<int>::closed((int)2,(int)4),2);
b+=make_pair(bicl::discrete_interval<int>::closed((int)6,(int)7),2);
b+=make_pair(bicl::discrete_interval<int>::closed((int)1,(int)3),2);;

c=a&b;

b=b-c;

    bicl::interval_map<int, int>::iterator it = b.begin();
    cout << "----- History of party guests -------------------------\n";
    while(it != b.end())
    {
      bicl::discrete_interval<int> itv  = it->first;
        // Who is at the party within the time interval 'when' ?
        int who = (*it++).second;
        cout << itv << ": " << who << endl;
    }






return 0;

for(int i=0;i<10;i++)
 cout <<i<<":"<<Poisson_cdist<double>(i,(100.0/2000.0)*10.0) << endl;





QString str="GAPDH STAT6 TPI1 SPSB2";

if(str.contains("STAT6"))
 cout <<"!!!" << endl;




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