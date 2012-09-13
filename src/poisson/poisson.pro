######################################################################
# pro file for averagedensity plot Wed Oct 19 14:59:16 2011
######################################################################

TEMPLATE = app
TARGET   = poisson

CONFIG   += console warn_on release
QT       -= gui
QT       += sql


MOC_DIR         = tmp/moc
OBJECTS_DIR     = tmp/obj

DEFINES     += _APPNAME=\\\"$$TARGET\\\"

HEADERS     += ../global/SqlReader.hpp \
               ../global/SamReader.hpp \
               ../global/PoissonHandler.hpp \
#               ../global/FileWriter.hpp \
#               ../global/PostHandler.hpp \
#               ../global/MGLWriter.hpp \
               poisson.hpp 
               
               
SOURCES     += ../global/SqlReader.cpp \
#               ../global/SamReader.cpp \
               ../global/PoissonHandler.cpp \
#               ../global/FileWriter.cpp \
#               ../global/PostHandler.cpp \
#               ../global/MGLwriter.cpp \
               main.cpp \
               poisson.cpp

INCLUDEPATH += . \
               ../global \
               ../../thirdparty/samtools-0.1.18 
#               ../../thirdparty/mathgl-1.11.2/include

DEPENDPATH  += .


LIBS        += ../../thirdparty/samtools-0.1.18/libbam.a \
               ../../thirdparty/mathgl-1.11.2/mgl/.libs/libmgl.a \
               -lgsl -lpng -lgslcblas -lm -lz

QMAKE_CXXFLAGS += -Werror

make_clean.commands = $(MAKE) clean

lib_samtools.commands = cd ../../thirdparty/samtools-0.1.18/; $(MAKE) -j 8

QMAKE_EXTRA_TARGETS = lib_samtools make_clean
PRE_TARGETDEPS      = lib_samtools make_clean

QMAKE_CLEAN += $$TARGET logfile.log *~ ../global/*~

