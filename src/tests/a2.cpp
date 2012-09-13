#include <iostream>


template <unsigned long N>
   struct binary
   {
       static unsigned const value
          = binary<N/10>::value << 1   // prepend higher bits
            | N%10;                    // to lowest bit
   };

template <>
   struct binary<0>
   {
       static unsigned const value=0;
   };


///---------------------------------------------------------------------

//template <class T> 
// struct iterator_traits;

template <class T>
    struct iterator_traits {
        typedef typename T::value_type value_type;
//        ...four more typedefs
    };

template <class T>
    struct iterator_traits<T*> {
        typedef T value_type;
//        ...four more typedefs
    };


 template <class ForwardIterator1, class ForwardIterator2>
    void iter_swap(ForwardIterator1 i1, ForwardIterator2 i2)
    {
//        typename                      // (see Language Note)
//          ForwardIterator1::value_type tmp = *i1;
typename
          iterator_traits<ForwardIterator1>::value_type tmp = *i1;

        *i1 = *i2;
        *i2 = tmp;
    }
//unsigned const one   =    binary<1>::value;
//unsigned const three =   binary<11>::value;
//unsigned const five  =  binary<101>::value;
//unsigned const seven =  binary<111>::value;
//unsigned const nine  = binary<1001>::value;

int main(void)
{

#define XXX(a) \
        std::cout << (1 a) << std::endl;\
        std::cout << (1 a) << std::endl;

XXX(+1);
XXX(-1);
//unsigned long a=101010;

//std::cout << binary<a>::value << std::endl;

/*double a[1]={1.1};
int b[1]={2};

double *p1=a;
int *p2=b;

iter_swap(p1,p2);

std::cout << a[0] << std::endl;

std::cout << b[0] << std::endl;
*/


return 0; 
}