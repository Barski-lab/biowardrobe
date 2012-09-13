######################################################################
# pro file for averagedensity plot Wed Oct 19 14:59:16 2011
######################################################################

TEMPLATE = app
TARGET   = averagedensity

CONFIG   += console warn_on release
QT       -= gui
QT       += sql

OBJECTS_DIR = GeneratedFiles
UI_DIR      = GeneratedFiles
MOC_DIR     = GeneratedFiles
RCC_DIR     = GeneratedFiles

DEFINES     += D_USE_BAM

HEADERS     += ../global/SamReader.hpp \
               ../global/AVDHandler.hpp \
               ../global/FileWriter.hpp \
	       ../global/Arguments.hpp \
               src/averagedensity.hpp 

#               ../global/MGLWriter.hpp \
#		../global/SqlReader.hpp \               
#               ../global/PostHandler.hpp \
               
SOURCES     += ../global/FileWriter.cpp \
               ../global/Reads.cpp \
	       ../global/Arguments.cpp \
               src/averagedensity.cpp \
               src/main.cpp 

INCLUDEPATH += . \
               ./src \
               ../global \
               ../../thirdparty/boost \               
               ../../thirdparty/bamtools 

DEPENDPATH  += .


!win32{

DEFINES        += _APPNAME=\\\"$$TARGET\\\"
LIBS           += -lgsl -lpng -lgslcblas -lm -lz ../../thirdparty/bamtools/libbamtools.a
QMAKE_CXXFLAGS += -Werror -std=c++0x

lib_bamtools.commands = cd ../../thirdparty/bamtools/; qmake; $(MAKE) -j 8
QMAKE_EXTRA_TARGETS   = lib_bamtools
PRE_TARGETDEPS        = lib_bamtools

}

win32{

DEFINES        += _APPNAME=\"$$TARGET\"
LIBS           += -lbamtools

}

QMAKE_CLEAN += $${TARGET} logfile.log *~ *.txt ../global/*~

