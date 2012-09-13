######################################################################
# pro file for complexity plot Wed Oct 19 14:59:16 2011
######################################################################

TEMPLATE = app
TARGET   = Template

CONFIG   += console warn_on release
QT       -= gui
QT       += sql



DEFINES      += _SQL_    \
                D_USE_BAM \
	        _NORMAL

!win32{

DEFINES                  += _APPNAME=\\\"$$TARGET\\\"
LIBS                     += -lgsl -lpng -lgslcblas -lm -lz ../../thirdparty/bamtools/libbamtools.a
QMAKE_CXXFLAGS           += -Werror 
#-std=c++0x

lib_bamtools.commands    = cd ../../thirdparty/bamtools/; qmake; $(MAKE) -j 8
QMAKE_EXTRA_TARGETS      = lib_bamtools
PRE_TARGETDEPS           = lib_bamtools

OBJECTS_DIR              = GeneratedFiles
UI_DIR                   = GeneratedFiles
MOC_DIR                  = GeneratedFiles
RCC_DIR                  = GeneratedFiles

}

win32{

DEFINES        += _APPNAME=\"$$TARGET\"
LIBS           += -lbamtools

}

DEPENDPATH  +=  . \
                ./src \
                ../global \
	        ../../thirdparty/bamtools \
                ../../thirdparty/boost

INCLUDEPATH +=  . \
                ./src \
                ../global \
                ../../thirdparty/boost \
                ../../thirdparty/bamtools



HEADERS     +=  src/Template.hpp \
		../global/Arguments.hpp
               
               
SOURCES     +=  src/main.cpp \
                src/Template.cpp \
		../global/Arguments.cpp




QMAKE_CLEAN += $$TARGET logfile.log *~ *.txt ../global/*~

